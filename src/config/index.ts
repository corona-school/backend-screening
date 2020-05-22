"use strict";

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export interface Config {
  env: string;
  redisUrl: string;
  name: string;
  port: number;
  sessionKeys: string[];
  session?: {
    secure?: boolean;
    sameSite?: string;
  };
}

interface ConfigWrapper {
  [key: string]: Config;
}

const env: string = process.env.NODE_ENV || "development";
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const baseConfig: Config = {
  env,
  redisUrl,
  name: "corona-queue-backend",
  port: 3001,
  sessionKeys: [process.env.COOKIE_SESSION_SECRET] || [],
};

const configs: ConfigWrapper = {
  production: {
    ...baseConfig,
    session: {
      secure: true,
      sameSite: "none",
    },
  },
  development: {
    ...baseConfig,
  },
  test: {
    ...baseConfig,
    port: 7000,
  },
};

const config: Config = configs[env] ? configs[env] : baseConfig;

export default config;
