declare const _default: () => {
    port: number;
    host: string;
    database: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
        fromName: string;
    };
    app: {
        url: string;
        allowedOrigins: string[];
        globalPrefix: string;
    };
    swagger: {
        enabled: boolean;
        path: string;
        title: string;
        description: string;
        version: string;
    };
};
export default _default;
