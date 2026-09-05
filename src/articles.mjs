import { articlesA } from './articles-a.mjs';
import { articlesB } from './articles-b.mjs';
import { articlesC } from './articles-c.mjs';

export const articles = [...articlesA, ...articlesB, ...articlesC];
export const getArticle = slug => articles.find(article => article.slug === slug);
