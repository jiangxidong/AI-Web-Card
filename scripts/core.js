class AIWebCard {
  constructor() {
    this.apiKey = '28f6f2890c1144dab5b2efdf36e837bf.xP60EZ3Q1vZbvZDd';
    this.apiEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.metadata = null;
    this.cardData = null;
    
    this.initElements();
    this.initEventListeners();
    this.init();
  }

  initElements() {
    this.loadingEl = document.getElementById('loading');
    this.cardPreviewEl = document.getElementById('card-preview');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.copyBtn = document.getElementById('copyBtn');
  }

  initEventListeners() {
    this.downloadBtn.addEventListener('click', () => this.downloadCard());
    this.copyBtn.addEventListener('click', () => this.copyCard());
  }

  async init() {
    this.showLoading();
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.metadata = await chrome.tabs.sendMessage(tab.id, { action: 'extractMetadata' });
      this.cardData = await this.generateCardData();
      this.renderCard();
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Failed to generate card. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  async generateCardData() {
    const prompt = this.generatePrompt();
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: `# 网页分享卡片生成
            - 作者：JasonJ
            - 名称：网页分享卡片生成
            - 版本：1.0
            - 用途：根据内容和链接，生成制作网页分享卡片所需的变量信息
            
            ## 任务
            根据模板要求，分析输入内容的语种，并以对应的语种，生成制作网页分享卡片所需的变量信息
            
            ## Workflow
            1. 读取网页内容、链接
            2. 按变量要求，生成制作网页分享卡片所需的变量数据
            
            注意：只需要直接输出变量数据, 不再输出任何额外文本解释`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error('AI API call failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const jsonStr = content.replace(/```json\s*|\s*```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return {
        DATE: this.formatDate(new Date()),
        TITLE: this.metadata.title,
        SUMMARY: this.metadata.meta.description || 'No description available',
        POINTS: [
          'Key point 1 not available',
          'Key point 2 not available',
          'Key point 3 not available',
          'Key point 4 not available'
        ],
        QR_TITLE: 'Scan to read more',
        QR_SUBTITLE: 'Click to view full content',
        PLATFORM: new URL(this.metadata.url).hostname,
        QR_URL: this.metadata.url
      };
    }
  }

  generatePrompt() {
    // 格式化日期为 YYYY/MM/DD
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/');
    };

    return `请分析以下网页内容，生成一个结构化的分享卡片数据：
    
网页标题：${this.metadata.title}
网页链接：${this.metadata.url}

时间信息：
- 文章发布日期：${formatDate(this.metadata.meta.publishDate) || formatDate(new Date())}
- 当前日期：${formatDate(new Date())}

元数据信息：
作者：${this.metadata.meta.author || '未知'}
描述：${this.metadata.meta.description || ''}
关键词：${this.metadata.meta.keywords || ''}

Open Graph 信息：
${JSON.stringify(this.metadata.openGraph, null, 2)}

网页正文内容：
${this.metadata.text}

请使用与原网页内容一致的语种，严格按照以下要求生成 JSON 格式数据：
1. DATE：使用 YYYY/MM/DD 格式的日期
2. TITLE：原文标题，限制在两行内
3. SUMMARY：140字以内的内容概述
4. POINTS：4个关键要点，每点15-20字
5. QR_TITLE：固定为"扫码阅读全文"
6. QR_SUBTITLE：15字以内的引导文案
7. PLATFORM：提取或识别文章发布平台
8. QR_URL：原文链接

{
  "DATE": "MM/DD/YYYY",
  "TITLE": "文章标题",
  "SUMMARY": "内容摘要",
  "POINTS": [
    "要点1",
    "要点2",
    "要点3",
    "要点4"
  ],
  "QR_TITLE": "Scan to read more",
  "QR_SUBTITLE": "引导扫码阅读的文案",
  "PLATFORM": "文章发布平台",
  "QR_URL": "${this.metadata.url}"
}`;
  }

  renderCard() {
    // 更新卡片内容
    document.querySelector('.card-date').textContent = this.cardData.DATE;
    document.querySelector('.card-title').textContent = this.cardData.TITLE;
    document.querySelector('.card-summary').textContent = this.cardData.SUMMARY;
    
    // 渲染要点列表（确保显示4个要点）
    const pointsList = document.querySelector('.card-points');
    pointsList.innerHTML = this.cardData.POINTS
      .slice(0, 4)
      .map(point => `<li>${point}</li>`)
      .join('');
    
    // 更新二维码区域
    document.querySelector('.qr-title').textContent = this.cardData.QR_TITLE;
    document.querySelector('.qr-subtitle').textContent = this.cardData.QR_SUBTITLE;
    document.querySelector('.platform').textContent = this.cardData.PLATFORM;
    
    // 清除已有的二维码
    const qrcodeEl = document.getElementById('qrcode');
    qrcodeEl.innerHTML = '';
    
    // 等待 DOM 更新完成后再生成二维码
    setTimeout(() => {
      // 生成新的二维码
      try {
        new QRCode(qrcodeEl, {
          text: this.cardData.QR_URL,
          width: 76,
          height: 76,
          correctLevel: QRCode.CorrectLevel.H,
          colorDark: "#2B2B2B",
          colorLight: "#FFFFFF",
          useSVG: true
        });

        // 确保二维码图片尺寸正确
        const qrImg = qrcodeEl.querySelector('img');
        if (qrImg) {
          qrImg.style.width = '76px';
          qrImg.style.height = '76px';
        }
      } catch (error) {
        console.error('QR code generation failed:', error);
      }
    }, 100);
  }

  async downloadCard() {
    try {
      const card = document.querySelector('.card');
      const canvas = await html2canvas(card, {
        willReadFrequently: true,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedCanvas = clonedDoc.createElement('canvas');
          clonedCanvas.getContext('2d', { willReadFrequently: true });
        }
      });
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const link = document.createElement('a');
      link.download = `webcard-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  }

  async copyCard() {
    try {
      const card = document.querySelector('.card');
      const canvas = await html2canvas(card, {
        willReadFrequently: true,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedCanvas = clonedDoc.createElement('canvas');
          clonedCanvas.getContext('2d', { willReadFrequently: true });
        }
      });
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Copied to clipboard');
        } catch (error) {
          console.error('Clipboard write failed:', error);
          const link = document.createElement('a');
          link.download = `webcard-${new Date().getTime()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          alert('Copy failed. Image downloaded instead.');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Copy failed. Please try again.');
    }
  }

  showLoading() {
    this.loadingEl.style.display = 'block';
    this.cardPreviewEl.style.display = 'none';
  }

  hideLoading() {
    this.loadingEl.style.display = 'none';
    this.cardPreviewEl.style.display = 'block';
  }
}

// 初始化应用
window.onload = () => {
  new AIWebCard();
}; 