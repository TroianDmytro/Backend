// src/users/interfaces/create-credentials.interface.ts
export interface CreateWithCredentialsDto {
    email: string;
    login: string;
    password: string;
    name?: string;
    second_name?: string;
    age?: number;
    telefon_number?: string;
}

