import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _keyAccessToken = 'access_token';
  static const _keyRefreshToken = 'refresh_token';
  static const _keySessionToken = 'session_token';
  static const _keyUserId = 'user_id';
  static const _keyDeviceFingerprint = 'device_fingerprint';

  Future<void> saveAccessToken(String token) async {
    if (token.isEmpty) throw ArgumentError('Token cannot be empty');
    await _storage.write(key: _keyAccessToken, value: token);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: _keyAccessToken);
  }

  Future<void> saveRefreshToken(String token) async {
    if (token.isEmpty) throw ArgumentError('Token cannot be empty');
    await _storage.write(key: _keyRefreshToken, value: token);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: _keyRefreshToken);
  }

  Future<void> saveSessionToken(String token) async {
    if (token.isEmpty) throw ArgumentError('Token cannot be empty');
    await _storage.write(key: _keySessionToken, value: token);
  }

  Future<String?> getSessionToken() async {
    return _storage.read(key: _keySessionToken);
  }

  Future<void> saveUserId(String userId) async {
    if (userId.isEmpty) throw ArgumentError('User ID cannot be empty');
    await _storage.write(key: _keyUserId, value: userId);
  }

  Future<String?> getUserId() async {
    return _storage.read(key: _keyUserId);
  }

  Future<void> saveDeviceFingerprint(String fingerprint) async {
    await _storage.write(key: _keyDeviceFingerprint, value: fingerprint);
  }

  Future<String?> getDeviceFingerprint() async {
    return _storage.read(key: _keyDeviceFingerprint);
  }

  Future<void> clearSession() async {
    await Future.wait([
      _storage.delete(key: _keyAccessToken),
      _storage.delete(key: _keyRefreshToken),
      _storage.delete(key: _keySessionToken),
      _storage.delete(key: _keyUserId),
    ]);
  }

  Future<bool> hasAccessToken() async {
    final token = await _storage.read(key: _keyAccessToken);
    return token != null && token.isNotEmpty;
  }
}