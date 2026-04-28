import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../../../shared/guards/jwt-auth.guard';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'dev_secret',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
