export declare class SecretsConfig {
    private static readonly logger;
    static getSecret(secretName: string, envVarName?: string, defaultValue?: string): string;
    static getAllSecrets(): {
        mongodbUri: string;
        jwtSecret: string;
        emailPassword: string;
        port: number;
        nodeEnv: string;
        emailHost: string;
        emailPort: number;
        emailUser: string;
        emailFrom: string;
        appUrl: string;
        corsOrigins: string;
    };
    static maskSensitiveData(data: string): string;
}
