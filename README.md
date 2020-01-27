# Image Optimizer for GitHub

Image Optimizer Action will automatically compress JPEG, PNG and GIF images in your repository using [Crush.pics](https://crush.pics/) API. It works like this:

- Action will scan your pull request for JPEG, PNG & GIF files and then it will send them to Crush.pics API for compression.
- After images are compressed, Action will update pull request with compressed images.
- Compression report is added to pull request comments.

![Screenshot of Image Optimizer Pull Request comment](https://user-images.githubusercontent.com/129972/73187362-348f0f00-4119-11ea-9c25-cdbadbec66e4.png)

## Add Image Optimizer to your workflow

1. Sign up for a free API key at [Crush.pics](https://crush.pics)
2. Open or create the `.github/workflows/crush-pics.yml` file.
3. Paste in the following:

```yml
name: Crush images
on:
  pull_request:
    branches:
      - master
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.gif'
jobs:
  crush:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Crush images
        uses: crush-pics/crush-pics-github-action@master
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.CRUSH_API_KEY }}
```

- `CRUSH_API_KEY` is your Crush.pics API key. Get one by creating a free account on [Crush.pics](https://crush.pics)

## Configure Image Optimizer

By default Image Optimizer will use our best available Balanced compression. However, if you’d like to change image compression mode or ignore specific file paths, read on.

Change the configuration options by adding a `.github/crush-pics/config.json` file:

```json
{
    "compression_mode": "balanced",
    "compression_level": 85,
    "strip_tags": false
}
```

- `compression_mode`: `lossy`, `lossless` or `balanced`
- `compression_level ` represents the compression level. Integer value has to be in range 65-100
- `strip_tags` removes optional metadata

**NOTE**: `compression_level` setting valid for `lossy` mode only. `balanced` & `lossless` will ignore it. If you leave it blank and use `lossy` mode - Image Optimizer will use default compression level (85%).

## Running the action only when images are changed

Image Optimizer is designed to run for each Pull Request. In some repositories, images are seldom updated. To run the action only when images have changed, use GitHub Action’s [`on.pull_request.paths`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#onpushpull_requestpaths) workflow configuration:

```yml
name: Crush images
on:
  pull_request:
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.gif'
```

The above workflow will only run when `jpg`, `png` or `gif` files are changed.

## Links

- [Crush.pics](https://crush.pics)
- [Crush.pics Support](https://crush.pics/help-center)
- [Crush.pics API Docs](https://docs.crush.pics)
- [GitHub Actions](https://github.com/features/actions)
