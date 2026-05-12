import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Pin the workspace root to this directory so Next doesn't walk upward
// and pick the parent checkout's package-lock.json when running inside a
// worktree (`.worktrees/v1.1/...`). Without this, module resolution
// uses the parent's node_modules (where @leash/sdk@^0.2.8 is installed)
// instead of the worktree's local @leash/sdk file: link.
const here = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: here,
    // Symlinks are followed by default, but a `file:` dep that points
    // outside the workspace root (e.g. ../../../leash-sdk-ts during v1.1
    // dev) needs explicit transpilation so Turbopack walks into it.
    // After we swap to a published @leash/sdk, this can be removed.
  },
  outputFileTracingRoot: here,
  transpilePackages: ['@leash/sdk'],
};

export default nextConfig;
