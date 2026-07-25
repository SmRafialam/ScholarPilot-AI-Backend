import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleUser } from '../types/auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    // Placeholders keep the app booting even before Google creds are set;
    // the OAuth routes simply won't work until real values are provided.
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const user: GoogleUser = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      fullName: profile.displayName ?? 'ScholarPilot User',
    };
    done(null, user);
  }
}
