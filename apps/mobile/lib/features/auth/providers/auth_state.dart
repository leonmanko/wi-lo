sealed class AuthState {
  const AuthState();
}

final class AuthInitial extends AuthState {
  const AuthInitial();
}

final class AuthLoading extends AuthState {
  const AuthLoading();
}

final class Authenticated extends AuthState {
  const Authenticated({
    required this.userId,
    required this.email,
    required this.name,
    this.role,
    this.birthDate,
    this.profile,
  });

  final String userId;
  final String email;
  final String name;
  final String? role;
  final String? birthDate;
  final Map<String, dynamic>? profile;
}

final class Unauthenticated extends AuthState {
  const Unauthenticated({this.reason});
  final String? reason;
}

final class AuthError extends AuthState {
  const AuthError({
    required this.message,
    this.isNetworkError = false,
  });

  final String message;
  final bool isNetworkError;
}