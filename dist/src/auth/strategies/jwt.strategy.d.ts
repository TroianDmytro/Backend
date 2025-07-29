import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(payload: any): Promise<{
        userId: any;
        email: any;
        isEmailVerified: boolean;
        roles: never[];
        name?: undefined;
        second_name?: undefined;
        age?: undefined;
        telefon_number?: undefined;
    } | {
        userId: any;
        email: any;
        name: string;
        second_name: string;
        age: number;
        telefon_number: string;
        isEmailVerified: boolean;
        roles: string[];
    }>;
}
export {};
