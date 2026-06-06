export interface MatchInput {
  submitted: string;
  stored: string;
}

export interface BiometricMatcher {
  match(input: MatchInput): Promise<number>;
}
