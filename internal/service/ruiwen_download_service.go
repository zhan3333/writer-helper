package service

import (
	"context"
	"fmt"
	htmltomarkdown "github.com/JohannesKaufmann/html-to-markdown/v2"
	"github.com/PuerkitoBio/goquery"
	"golang.org/x/text/encoding/simplifiedchinese"
	"net/http"
)

type RuiWenDownloadService struct {
}

func NewRuiWenDownloadService() *RuiWenDownloadService {
	return &RuiWenDownloadService{}
}

func (s RuiWenDownloadService) Download(ctx context.Context, link string) (string, error) {
	resp, err := http.Get(link)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 创建 Document 对象
	reader := simplifiedchinese.GBK.NewDecoder().Reader(resp.Body)

	doc, err := goquery.NewDocumentFromReader(reader)

	if err != nil {
		return "", fmt.Errorf("failed to create document: %w", err)
	}

	var content string

	// 查找所有 class 为 article 的 div 元素
	doc.Find("div.article").Each(func(i int, s *goquery.Selection) {
		// 获取元素的文本内容
		content, err = s.Html()
	})

	if err != nil {
		return "", fmt.Errorf("failed to find element: %w", err)
	}

	return content, nil
}

func convertToMarkdown(content string) (string, error) {
	return htmltomarkdown.ConvertString(content)
}
