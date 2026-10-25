# photos-inbox

Drop your own photos here, one folder per post:

```
photos-inbox/
  autumn-mantel-styling/
    hero.jpg        hero.txt       ← line 1: alt text, line 2: caption (optional)
    photo-1.jpg     photo-1.txt
```

Then run `npm run photos` (or `npm run photos -- autumn-mantel-styling` for one post).

`hero` replaces the post's hero image and generates the 2:3 Pinterest pin. Any other
name is resized and registered, and its `<figure>` snippet is printed for you to paste.

To have a photo placed automatically, find its marker in the post and add a file name:

```html
<!-- [ADD YOUR PHOTO: the empty, wiped-down mantel] {file: photo-1} -->
```

Each photo is rotated upright, **stripped of metadata including GPS location**, and saved
as WebP at 480/960/1440px. Originals move to `done/`.

See `PHOTO-SHOT-LIST.md` in the project root for what to shoot for each post.

Everything in this folder except this README is ignored by git, so your originals stay
on your computer.
