import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Triggers the Google OAuth redirect / callback flow. */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
