export interface IUsernameGenerator {
  generate(email: string): Promise<string>;
}