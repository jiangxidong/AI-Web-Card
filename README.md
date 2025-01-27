# AI Web Card

A Chrome extension that transforms web links into beautiful share cards with AI-powered summaries and QR codes.

## Key Features

- Smart webpage content analysis with AI-generated summaries and key points
- Beautiful share cards with titles, summaries, key points, and QR codes
- Support for downloading cards as images or copying to clipboard
- Compatible with various webpage types including articles, videos, and e-commerce pages
- Supports Chrome, Edge, and other major browsers

## Installation

1. Download the project code
2. Open Chrome browser and navigate to the extensions page (chrome://extensions/)
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the project directory to complete installation

## Usage

1. Click the extension icon on any webpage you want to share
2. Wait a few seconds for the extension to generate the share card
3. Choose to download the card image or copy to clipboard
4. Share the generated card on social media or other platforms

## Technical Implementation

- Built with Chrome Extension Manifest V3
- Uses Service Workers instead of Background Pages
- Powered by GLM-4-flash AI model for summary generation
- Implements QRCode.js for QR code generation
- Uses html2canvas for card export

## Test Cases

### Core Functionality Tests
| Test ID | Scenario | Steps | Expected Results |
|---------|----------|-------|-----------------|
| FC-001 | Parse standard webpage | 1. Visit news page with OpenGraph tags<br>2. Click extension icon | Auto-extract:<br>- Correct page title<br>- 80-char structured summary |
| FC-002 | Fallback parsing | 1. Visit blog with no structured data<br>2. Click extension icon | Display:<br>- Page title<br>- First paragraph content |
| FC-003 | QR code verification | 1. Generate card<br>2. Scan QR code | QR code redirects to original URL |

### User Flow Tests
| Test ID | Flow Path | Verification Points |
|---------|-----------|-------------------|
| UF-001 | Complete download flow | Extension click -> Process -> Preview -> Download PNG | Full process <15s, output 1080px PNG |
| UF-002 | Complete copy flow | Extension click -> Process -> Preview -> Click copy | Clipboard contains card image |

## Important Notes

1. Please ensure the webpage is fully loaded before clicking the extension icon
2. Some pages may require longer processing time
3. If generation fails, please refresh the page and try again

## Development Roadmap

1. Support for custom card templates
2. Add batch processing capability
3. Support for more languages
4. Optimize generation speed
5. Add more sharing options

## Contributing

Issues and Pull Requests are welcome to help improve this project.

## License

MIT License 