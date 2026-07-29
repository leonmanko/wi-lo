import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Service d'upload de fichiers vers Supabase Storage via le backend tRPC.
///
/// Tous les uploads passent par le backend pour :
/// - Valider le type de fichier (images uniquement)
/// - Scanner les virus
/// - Modérer le contenu (détection d'images inappropriées)
/// - Limiter la taille
class FileUploadService {
  FileUploadService({required this.baseUrl, required this.getAccessToken});

  final String baseUrl;
  final Future<String?> Function() getAccessToken;

  /// Upload un avatar utilisateur.
  ///
  /// [filePath] : chemin du fichier local
  /// Retourne l'URL publique de l'avatar sur le CDN.
  ///
  /// Lance [Exception] si :
  /// - Le fichier dépasse la taille maximale (5 Mo)
  /// - Le type MIME n'est pas supporté
  /// - Le backend refuse l'upload (virus, contenu inapproprié)
  /// - Erreur réseau
  Future<String> uploadAvatar(String filePath) async {
    final file = File(filePath);

    // Validation côté client (le backend re-valide)
    if (!await file.exists()) {
      throw Exception('Fichier introuvable.');
    }

    final fileSize = await file.length();
    if (fileSize > 5 * 1024 * 1024) {
      throw Exception('L\'image ne doit pas dépasser 5 Mo.');
    }

    final extension = filePath.split('.').last.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExtensions.contains(extension)) {
      throw Exception('Format non supporté. Utilisez JPG, PNG ou WebP.');
    }

    final token = await getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('Vous devez être connecté.');
    }

    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/trpc/user.uploadAvatar'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(
      await http.MultipartFile.fromPath('avatar', filePath,
          filename: 'avatar.$extension'),
    );

    try {
      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 30),
      );
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        return data['avatarUrl'] as String;
      } else if (response.statusCode == 413) {
        throw Exception('L\'image est trop volumineuse.');
      } else if (response.statusCode == 415) {
        throw Exception('Format de fichier non supporté.');
      } else if (response.statusCode == 422) {
        final error = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(
          error['message'] as String? ?? 'Image refusée par le serveur.',
        );
      } else {
        throw Exception('Erreur lors de l\'upload (${response.statusCode}).');
      }
    } on SocketException {
      throw Exception('Impossible de contacter le serveur.');
    } on Exception {
      rethrow;
    }
  }
}