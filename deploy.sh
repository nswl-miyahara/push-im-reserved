gcloud config set project miya-sandbox

gcloud functions deploy push-im-reserved \
    --region asia-northeast1 --runtime nodejs16 --trigger-topic push-im-reserved-topic --set-secrets IM_ID=projects/159853155666/secrets/im-id:1 --set-secrets IM_PASS=projects/159853155666/secrets/im-pass:1 --set-secrets WEBHOOK_URL=projects/159853155666/secrets/webhook-url:2 --entry-point main --source ./src/