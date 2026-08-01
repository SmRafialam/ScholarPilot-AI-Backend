import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TrackDto {
  @IsString() @MaxLength(512) path!: string;
  @IsString() @MaxLength(128) visitorId!: string;
  @IsOptional() @IsString() @MaxLength(512) referrer?: string;
}
