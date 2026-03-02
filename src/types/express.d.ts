// src/types/express.d.ts
import * as express from 'express';

declare global {
    namespace Express {
        interface UserRole {
            name?: string;
            code?: string;
            societyId?: string;
            [key: string]: any;
        }

        interface User {
            id: string;
            role: UserRole;
            email?: string;
            [key: string]: any;
        }

        interface Request {
            user: User;
            role: string;
            sessionId?: string;
            session?: { id: string;[key: string]: any };
            societyId?: string;
            subscriptionId?: string;
        }
    }
}
