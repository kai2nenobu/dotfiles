#!/usr/bin/env bash

## GitHub Actionsのログを収集するスクリプト。
## CIのAnsible適用に失敗した原因を確認するために使う想定。
##
## ghコマンドを使うのであらかじめgh auth loginしておきましょう

set -eu

owner=kai2nenobu
repo=dotfiles
workflow_id=2428375 # CI workflow
log_zip=$(mktemp XXXXXXXX.zip)

cleanup() {
  rm -f "$log_zip"
}
trap cleanup EXIT

fetch_failed_runs() {
  # 90日以内の失敗した実行一覧を取得する
  three_months_ago=$(date -d '90 days ago' +%Y-%m-%d)
  endpoint="/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs?status=failure&created=>=${three_months_ago}&per_page=100"
  gh api --paginate --jq '.workflow_runs[].id' "$endpoint"
}

extract_failure_reason() {
  run_id=${1?:Specify run id}
  # ログアーカイブをダウンロードする
  gh api "/repos/${owner}/${repo}/actions/runs/${run_id}/logs" > "$log_zip" || return 0
  # Ansibleの実行ログを抜き出す
  ansible_job_log='windows (windows, Ubuntu-20.04)/10_Apply ansible playbook.txt'
  unzip -p "$log_zip" "$ansible_job_log" | grep 'failed:' || true
}

fetch_failed_runs | while IFS= read -r run_id; do
  printf "$run_id: "
  extract_failure_reason "$run_id"
done
