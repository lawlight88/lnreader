import { htmlToText } from '../helpers/htmlToText';

const sourceId = 116;
const sourceName = 'Renovels';

const baseUrl = 'https://renovels.org/';

const popularNovels = async page => {
  const totalPages = 20;
  const url =
    'https://api.renovels.org/api/titles/last-chapters/?&count=20&page=' + page;
  const result = await fetch(url);
  let body = await result.json();

  let novels = [];

  body.content.map(item => {
    const novelName = item.rus_name;
    const novelCover = 'https://api.renovels.org' + item.img.mid;
    const novelUrl = item.dir;
    novels.push({ sourceId, novelName, novelCover, novelUrl });
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch('https://api.renovels.org/api/titles/' + novelUrl);
  let body = await result.json();

  let novel = {
    sourceId,
    sourceName,
    url: baseUrl + 'novel/' + body.content.dir,
    novelName: body.content.rus_name,
    novelCover: 'https://api.renovels.org' + body.content.img?.high || body.content.img?.low,
    summary: htmlToText(body.content.description),
    novelUrl,
  };

  let all = (body.content.count_chapters / 100 + 1) ^ 0
  let chapters = [];

  for (let i = 0; i < all; i++) {
    let chapterResult = await fetch(
      `https://api.renovels.org/api/titles/chapters/?branch_id=${body.content.branches[0].id}&count=100&page=${i + 1}`,
    );
    let volumes = await chapterResult.json();

    volumes.content.map(item => {
      const chapterName =
        `Том ${item.tome} Глава ${item.chapter} ${item.name}`?.trim();
      const releaseDate = item.upload_date;
      const chapterUrl = 'https://api.renovels.org/api/titles/chapters/' + item.id + '/';

      if (!item.is_paid) chapters.push({ chapterName, releaseDate, chapterUrl });
    });
  }

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.json();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: body.content.name || body.content.chapter,
    chapterText: body.content.content,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `https://api.renovels.org/api/search/?query=${searchTerm}&count=100&field=titles`;
  const result = await fetch(url);
  let body = await result.json();
  let novels = [];

  body.content.map(item => {
    const novelName = item.rus_name;
    const novelCover = 'https://api.renovels.org' + item.img.mid;
    const novelUrl = item.dir;
    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  return novels;
};

const RenovelsScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RenovelsScraper;