// 从页面中提取元数据
function extractMetadata() {
  const metadata = {
    title: document.title,
    url: window.location.href,
    meta: {
      publishDate: '',
      author: '',
      description: '',
      keywords: ''
    },
    openGraph: {},
    text: ''
  };

  // 提取 meta 标签信息
  const metaTags = document.getElementsByTagName('meta');
  for (const meta of metaTags) {
    const name = meta.getAttribute('name')?.toLowerCase();
    const property = meta.getAttribute('property')?.toLowerCase();
    const content = meta.getAttribute('content');

    if (!content) continue;

    // 处理标准 meta 标签
    if (name === 'author') metadata.meta.author = content;
    if (name === 'description') metadata.meta.description = content;
    if (name === 'keywords') metadata.meta.keywords = content;
    if (name === 'article:published_time') metadata.meta.publishDate = content;

    // 处理 Open Graph 标签
    if (property?.startsWith('og:')) {
      const key = property.replace('og:', '');
      metadata.openGraph[key] = content;
    }
  }

  // 提取发布日期
  if (!metadata.meta.publishDate) {
    const dateElements = document.querySelectorAll('time, [class*="time"], [class*="date"]');
    for (const el of dateElements) {
      const dateStr = el.getAttribute('datetime') || el.textContent;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        metadata.meta.publishDate = date.toISOString().split('T')[0];
        break;
      }
    }
  }

  // 提取正文内容
  const articleContent = document.querySelector('article') || document.body;
  metadata.text = articleContent.textContent
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15000);

  return metadata;
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractMetadata') {
    sendResponse(extractMetadata());
  }
}); 