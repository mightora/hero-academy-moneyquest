import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../dist/content.js';
import { LESSONS, getLesson } from '../dist/lessons.js';

test('each of the twenty money stops teaches a matching concept before play', () => {
  const money = LEVELS.filter((level) => level.type === 'money');
  assert.equal(money.length, 20);
  assert.equal(Object.keys(LESSONS).length, money.length);
  for (const level of money) {
    const lesson = getLesson(level.id);
    assert.ok(lesson, `Missing lesson for stop ${level.number}`);
    assert.equal(lesson.id, level.id);
    assert.ok(lesson.explain.length >= 20 && lesson.explain.length <= 150);
    assert.equal(lesson.pictures.length, 2);
    for (const picture of lesson.pictures) {
      assert.equal(picture.length, 3);
      assert.ok(picture.every((piece) => typeof piece === 'string' && piece.length > 0));
    }
    assert.ok(lesson.ask.endsWith('?'));
    assert.equal(lesson.answers.length, 3);
    assert.equal(new Set(lesson.answers).size, 3);
    assert.ok(Number.isInteger(lesson.correct) && lesson.correct >= 0 && lesson.correct < 3);
    assert.ok(lesson.why.length > 10);
    assert.ok(lesson.hint.length > 10);
  }
  for (const level of LEVELS.filter((level) => level.type === 'play'))
    assert.equal(getLesson(level.id), null);
  assert.equal(getLesson(-1), null);
  assert.equal(getLesson(30), null);
});

test('financial lessons do not contain game or cloud progress mutations', () => {
  for (const lesson of Object.values(LESSONS)) {
    const forbidden = ['effect', 'reward', 'xp', 'cost', 'wallet', 'savings', 'current', 'done', 'sync', 'token'];
    for (const field of forbidden)
      assert.ok(!Object.hasOwn(lesson, field), `Unexpected state field ${field}`);
  }
});

test('the deployed app starts teaching before showing money choices', async () => {
  const fs = await import('node:fs/promises');
  const app = await fs.readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  const sw = await fs.readFile(new URL('../dist/sw.js', import.meta.url), 'utf8');
  assert.match(app, /renderLesson\(l, replay\);\s*}\s*function renderLesson/);
  assert.match(app, /id="lesson-continue" hidden/);
  assert.match(app, /correct \? "That's it!/);
  assert.match(sw, /'\.\/lessons\.js'/);
});
