import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/tokens/app_colors.dart';

/// Widget de sélection et preview d'avatar.
///
/// États couverts :
/// - Vide (pas d'avatar, initiales affichées)
/// - Sélection en cours (image_picker ouvert)
/// - Preview (image sélectionnée affichée avant upload)
/// - Erreur (message si la sélection échoue)
class AvatarPicker extends StatefulWidget {
  const AvatarPicker({
    super.key,
    this.currentAvatarUrl,
    this.name = '',
    this.onImageSelected,
    this.isUploading = false,
  });

  /// URL de l'avatar actuel (depuis le profil).
  final String? currentAvatarUrl;

  /// Nom de l'utilisateur (pour les initiales).
  final String name;

  /// Callback quand une image locale est sélectionnée.
  final void Function(File imageFile)? onImageSelected;

  /// Désactive la sélection pendant l'upload.
  final bool isUploading;

  @override
  State<AvatarPicker> createState() => _AvatarPickerState();
}

class _AvatarPickerState extends State<AvatarPicker> {
  final _picker = ImagePicker();
  File? _selectedFile;
  String? _errorMessage;

  String get _initials {
    if (widget.name.isEmpty) return '?';
    return widget.name
        .split(' ')
        .map((e) => e.isNotEmpty ? e[0].toUpperCase() : '')
        .take(2)
        .join();
  }

  Future<void> _pickImage(ImageSource source) async {
    setState(() => _errorMessage = null);

    try {
      final pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );

      if (pickedFile != null && mounted) {
        setState(() => _selectedFile = File(pickedFile.path));
        widget.onImageSelected?.call(File(pickedFile.path));
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = 'Erreur lors de la sélection.');
      }
    }
  }

  void _showPickerOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textTertiary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Photo de profil',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.camera_alt,
                    color: AppColors.accentPrimary),
                title: const Text(
                  'Prendre une photo',
                  style: TextStyle(color: AppColors.textPrimary),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library,
                    color: AppColors.accentPrimary),
                title: const Text(
                  'Choisir dans la galerie',
                  style: TextStyle(color: AppColors.textPrimary),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
              if (_selectedFile != null || widget.currentAvatarUrl != null)
                ListTile(
                  leading:
                      const Icon(Icons.delete, color: AppColors.accentError),
                  title: const Text(
                    'Supprimer la photo',
                    style: TextStyle(color: AppColors.accentError),
                  ),
                  onTap: () {
                    Navigator.pop(ctx);
                    setState(() => _selectedFile = null);
                    widget.onImageSelected?.call(null as File);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Avatar
        GestureDetector(
          onTap: widget.isUploading ? null : _showPickerOptions,
          child: Stack(
            children: [
              // Cercle avatar
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.accentPrimary.withAlpha(76),
                    width: 3,
                  ),
                ),
                child: ClipOval(
                  child: _selectedFile != null
                      ? Image.file(
                          _selectedFile!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return _buildInitialsAvatar();
                          },
                        )
                      : widget.currentAvatarUrl != null &&
                              widget.currentAvatarUrl!.isNotEmpty
                          ? Image.network(
                              widget.currentAvatarUrl!,
                              fit: BoxFit.cover,
                              loadingBuilder:
                                  (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return _buildInitialsAvatar();
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return _buildInitialsAvatar();
                              },
                            )
                          : _buildInitialsAvatar(),
                ),
              ),

              // Badge appareil photo
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: widget.isUploading
                        ? AppColors.textTertiary
                        : AppColors.accentPrimary,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.backgroundPrimary,
                      width: 3,
                    ),
                  ),
                  child: widget.isUploading
                      ? const Padding(
                          padding: EdgeInsets.all(8),
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.backgroundPrimary,
                          ),
                        )
                      : const Icon(
                          Icons.camera_alt,
                          size: 18,
                          color: AppColors.backgroundPrimary,
                        ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Message erreur
        if (_errorMessage != null) ...[
          Text(
            _errorMessage!,
            style: const TextStyle(
              color: AppColors.accentError,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
        ],

        // Texte d'aide
        Text(
          widget.isUploading ? 'Upload en cours...' : 'Appuyez pour modifier',
          style: const TextStyle(
            color: AppColors.textTertiary,
            fontSize: 13,
          ),
        ),
      ],
    );
  }

  Widget _buildInitialsAvatar() {
    return Container(
      color: AppColors.accentPrimary.withAlpha(40),
      child: Center(
        child: Text(
          _initials,
          style: const TextStyle(
            color: AppColors.accentPrimary,
            fontSize: 36,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}