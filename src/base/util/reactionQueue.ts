import { Collection } from "discord.js";

type Task = () => Promise<void>;


export const reactionQueue: Collection<string, Task[]> = new Collection();
export const processing: Collection<string, boolean> = new Collection();

export async function enqueueReaction(messageId: string, task: Task) {
    if (!reactionQueue.has(messageId)) {
        reactionQueue.set(messageId, []);
    }

    reactionQueue.get(messageId)!.push(task);

    if (processing.get(messageId)) return;

    processing.set(messageId, true);

    while (reactionQueue.get(messageId)!.length > 0) {
        const nextTask = reactionQueue.get(messageId)!.shift()!;
        try {
            await nextTask();
        } catch (err) {
            console.error(`Error processing reaction queue for message ${messageId}:`, err);
        }
    }

    processing.delete(messageId);
    reactionQueue.delete(messageId);
}
