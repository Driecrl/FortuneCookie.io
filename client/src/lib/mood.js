// Picks a picture that matches the mood of the fortune.
// Pictures live in client/public/art/mood/ (happy-1.jpg ... bad-5.jpg).
import bank from "../data/fortunes.json";

const HAPPY = ["happy-1", "happy-2", "happy-3"];
const BAD = ["bad-1", "bad-2", "bad-3", "bad-4", "bad-5"];
const ALL = [...HAPPY, ...BAD];
const PICTURES = {
  good: HAPPY, love: HAPPY, money: HAPPY, life: HAPPY, cat: HAPPY, dog: HAPPY, // lucky -> happy cats
  bad: BAD,                                                                      // bad luck -> sad / annoyed
  mystery: ["bad-4", "happy-3"],                                                 // suspicious side-eye or a sneaky smile
  meme: ALL, random: ALL,
};

const groupOf = {};
for (const [group, list] of Object.entries(bank)) for (const t of list) groupOf[t] = group;
const rand = (a) => a[Math.floor(Math.random() * a.length)];

export function moodFor(text, golden) {
  const pool = golden ? HAPPY : PICTURES[groupOf[text]] || ALL;
  return `/art/mood/${rand(pool)}.jpg`;
}