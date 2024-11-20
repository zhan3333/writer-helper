package service

import (
	"bytes"
	"context"
	"fmt"
	"github.com/iawia002/lux/downloader"
	"github.com/iawia002/lux/extractors"
	"github.com/iawia002/lux/request"
	"github.com/iawia002/lux/utils"
	"io"
	"sort"
)

func init() {
	fmt.Println("download service init")
}

var downloadOutput = bytes.NewBufferString("")

type DownloadService struct {
}

func NewDownloadService() *DownloadService {
	return &DownloadService{}
}

func (s DownloadService) Download(ctx context.Context, videoURL string, savePath string) (string, error) {
	// reset output
	downloadOutput = bytes.NewBufferString("")
	fmt.Println("reset download output")
	request.SetOptions(request.Options{
		//RetryTimes: int(c.Uint("retry")),
		//Cookie:     cookie,
		//UserAgent:  c.String("user-agent"),
		//Refer:      c.String("refer"),
		//Debug:      c.Bool("debug"),
		//Silent:     c.Bool("silent"),
	})

	if err := download(ctx, videoURL, savePath); err != nil {
		return "", fmt.Errorf("download %s error: %w", videoURL, err)
	}
	return "", nil
}

func (s DownloadService) GetDownloadOutput() string {
	if downloadOutput.Len() > 0 {
		bs, _ := io.ReadAll(downloadOutput)
		return string(bs)
	}
	return ""
}

func download(ctx context.Context, videoURL string, savePath string) error {
	data, err := extractors.Extract(videoURL, extractors.Options{
		//Playlist:         c.Bool("playlist"),
		//Items:            c.String("items"),
		//ItemStart:        int(c.Uint("start")),
		//ItemEnd:          int(c.Uint("end")),
		//ThreadNumber:     int(c.Uint("thread")),
		//EpisodeTitleOnly: c.Bool("episode-title-only"),
		//Cookie:           c.String("cookie"),
		//YoukuCcode:       c.String("youku-ccode"),
		//YoukuCkey:        c.String("youku-ckey"),
		//YoukuPassword:    c.String("youku-password"),
	})
	if err != nil {
		// if this error occurs, it means that an error occurred before actually starting to extract data
		// (there is an error in the preparation step), and the data list is empty.
		return err
	}

	//if c.Bool("json") {
	//	e := json.NewEncoder(os.Stdout)
	//	e.SetIndent("", "\t")
	//	e.SetEscapeHTML(false)
	//	if err := e.Encode(data); err != nil {
	//		return err
	//	}
	//
	//	return nil
	//}

	if len(data) == 0 {
		return fmt.Errorf("no data")
	}

	// Skip the complete file that has been merged
	title := data[0].Title
	ext := ""
	for _, s := range data[0].Streams {
		ext = s.Ext
		break
	}
	mergedFilePath, err := utils.FilePath(title, ext, 0, savePath, false)
	if err != nil {
		return err
	}
	_, mergedFileExists, err := utils.FileSize(mergedFilePath)
	if err != nil {
		return err
	}
	// After the merge, the file size has changed, so we do not check whether the size matches
	if mergedFileExists {
		return fmt.Errorf("%s: 文件已存在，请删除后再尝试下载", mergedFilePath)
	}

	defaultDownloader := downloader.New(downloader.Options{
		//Silent:         c.Bool("silent"),
		//InfoOnly:       c.Bool("info"),
		//Stream:         c.String("stream-format"),
		//AudioOnly:      c.Bool("audio-only"),
		//Refer:          c.String("refer"),
		OutputPath: savePath,
		//OutputName: filename,
		//FileNameLength: int(c.Uint("file-name-length")),
		//Caption:        c.Bool("caption"),
		//MultiThread:    c.Bool("multi-thread"),
		//ThreadNumber:   int(c.Uint("thread")),
		//RetryTimes:     int(c.Uint("retry")),
		//ChunkSizeMB:    int(c.Uint("chunk-size")),
		//UseAria2RPC:    c.Bool("aria2"),
		//Aria2Token:     c.String("aria2-token"),
		//Aria2Method:    c.String("aria2-method"),
		//Aria2Addr:      c.String("aria2-addr"),
	})
	errors := make([]error, 0)
	for _, item := range data {
		if item.Err != nil {
			// if this error occurs, the preparation step is normal, but the data extraction is wrong.
			// the data is an empty struct.
			errors = append(errors, item.Err)
			continue
		}

		// output1
		sortedStreams := genSortedStreams(item.Streams)
		streamName := sortedStreams[0].ID
		//title := item.Title
		stream, ok := item.Streams[streamName]
		if !ok {
			return fmt.Errorf("no stream named %s", streamName)
		}
		printStreamInfo(item, stream)

		if err = defaultDownloader.Download(item); err != nil {
			errors = append(errors, err)
		}
	}
	if len(errors) != 0 {
		return errors[0]
	}
	return nil
}

func genSortedStreams(streams map[string]*extractors.Stream) []*extractors.Stream {
	sortedStreams := make([]*extractors.Stream, 0, len(streams))
	for _, data := range streams {
		sortedStreams = append(sortedStreams, data)
	}
	if len(sortedStreams) > 1 {
		sort.SliceStable(
			sortedStreams, func(i, j int) bool { return sortedStreams[i].Size > sortedStreams[j].Size },
		)
	}
	return sortedStreams
}

func printHeader(data *extractors.Data) {
	downloadOutput.WriteString("\n")
	_, _ = fmt.Fprintf(downloadOutput, " Site:      %s\n", data.Site)
	_, _ = fmt.Fprintf(downloadOutput, " Title:      %s\n", data.Title)
	_, _ = fmt.Fprintf(downloadOutput, " Type:      %s\n", data.Type)
}

func printStream(stream *extractors.Stream) {
	_, _ = fmt.Fprintf(downloadOutput, "     [%s]  -------------------\n", stream.ID) // nolint
	if stream.Quality != "" {
		_, _ = fmt.Fprintf(downloadOutput, "     Quality:         %s\n", stream.Quality) // nolint
	}
	_, _ = fmt.Fprintf(downloadOutput, "     Size:            %.2f MiB (%d Bytes)\n", float64(stream.Size)/(1024*1024), stream.Size) // nolint
	_, _ = fmt.Fprintf(downloadOutput, "     # download with: lux -f %s ...\n\n", stream.ID)                                         // nolint
}

func printInfo(data *extractors.Data, sortedStreams []*extractors.Stream) {
	printHeader(data)

	_, _ = fmt.Fprintf(downloadOutput, " Streams:   ") // nolint
	_, _ = fmt.Fprintln(downloadOutput, "# All available quality")
	for _, stream := range sortedStreams {
		printStream(stream)
	}
}

func printStreamInfo(data *extractors.Data, stream *extractors.Stream) {
	printHeader(data)

	_, _ = fmt.Fprintf(downloadOutput, " Stream:   \n") // nolint
	printStream(stream)
}
