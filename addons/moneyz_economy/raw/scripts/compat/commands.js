/** Executes a command while retaining compatibility with API versions exposing sync/async variants. */
export async function runCommand(target, command) {
    if (!target) return;
    const runner = target.dimension ?? target;
    if (typeof runner.runCommand === "function") return runner.runCommand(command);
    if (typeof runner.runCommandAsync === "function") return await runner.runCommandAsync(command);
    if (typeof target.runCommand === "function") return target.runCommand(command);
    if (typeof target.runCommandAsync === "function") return await target.runCommandAsync(command);
}
