npm run build
rsync -r build_webpack/ docs/
git add .
git commit -m "Assets for github Pages"
git push origin master