import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../core/secure_storage/secure_storage_service.dart';
class AuthRepository {
  AuthRepository({
    required this.baseUrl,
    required SecureStorageService secureStorage,
    http.Client? httpClient,
  })  : _secureStorage = secureStorage,
        _httpClient = httpClient ?? http.Client();

  final String baseUrl;
  final SecureStorageService _secureStorage;
  final http.Client _httpClient;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    String? deviceFingerprint,
    String? ipAddress,
  }) async {
    final body = <String, dynamic>{
      'email': email.trim(),
      'password': password,
    };

    if (deviceFingerprint != null && deviceFingerprint.isNotEmpty) {
      body['deviceFingerprint'] = deviceFingerprint;
    }
    if (ipAddress != null && ipAddress.isNotEmpty) {
      body['ipAddress'] = ipAddress;
    }

    final response = await _httpClient.post(
      Uri.parse('$baseUrl/trpc/auth.login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      await Future.wait([
        _secureStorage.saveAccessToken(data['accessToken'] as String),
        if (data['token'] != null)
          _secureStorage.saveSessionToken(data['token'] as String),
        if (data['refreshToken'] != null)
          _secureStorage.saveRefreshToken(data['refreshToken'] as String),
        _secureStorage.saveUserId((data['id'] ?? data['userId']) as String),
      ]);
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('Email ou mot de passe incorrect.');
    } else {
      throw Exception('Erreur serveur (${response.statusCode}).');
    }
  }

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    required String birthDate,
    required Map<String, bool> consents,
  }) async {
    final response = await _httpClient.post(
      Uri.parse('$baseUrl/trpc/auth.register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
        'name': name.trim(),
        'birthDate': birthDate,
        'consents': consents,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erreur lors de l\'inscription.');
    }
  }

  Future<Map<String, dynamic>> me() async {
    final token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('Non authentifié.');
    }

    final response = await _httpClient.get(
      Uri.parse('$baseUrl/trpc/auth.me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else if (response.statusCode == 401) {
      throw Exception('Session expirée.');
    } else {
      throw Exception('Erreur serveur (${response.statusCode}).');
    }
  }

  Future<void> logout() async {
    try {
      final sessionToken = await _secureStorage.getSessionToken();
      if (sessionToken != null && sessionToken.isNotEmpty) {
        await _httpClient.post(
          Uri.parse('$baseUrl/trpc/auth.logout'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'sessionToken': sessionToken}),
        );
      }
    } catch (_) {
      // On ignore les erreurs serveur
    } finally {
      await _secureStorage.clearSession();
    }
  }

  Future<bool> isLoggedIn() async {
    return _secureStorage.hasAccessToken();
  }

  Future<String?> getLocalUserId() async {
    return _secureStorage.getUserId();
  }

  void dispose() {
    _httpClient.close();
  }
}