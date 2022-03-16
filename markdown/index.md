---
title: Welcome to marktree!
---

# marktree 🔖🌳

marktree is a static site generator, using markdown. It works with GitHub pages out of the box.

## Get started
[create-marktree](https://github.com/magnetenstad/create-marktree) is the quickest way to start a marktree project.

1. Initiate create-marktree
```sh
npm init marktree@latest
npm i
```
2. Run marktree in dev
```sh
npm run dev
```
3. Host `docs/index.html`, e.g. with LiveServer
4. Write your markdown  


## Functionality

### Connections
The links above are automatically generated!

### Markdown - extended

#### Basic markdown
1. First list item
2. Second item
   - Subitem

*Italics*, **Bold text**

And | tables
--- | ---
of | course.

#### Code highlighting
Both `inline('highlighting')` and 
```js
// Code blocks!
let count = 0;
count++;
console.log(`Count: ${count}`);
```
Enabled by [highlight.js](https://www.npmjs.com/package/highlight.js?activeTab=readme)

#### Maths
Both $\text{inline} + 1 + 2 + 3 + \dots$
and
$$
(\text{equations})^2 - \int_0^1x \: dx
$$
Enabled by [@iktakahiro/markdown-it-katex](https://www.npmjs.com/package/@iktakahiro/markdown-it-katex)

### Images
Here's a gull
![](images/gull.jpg)
