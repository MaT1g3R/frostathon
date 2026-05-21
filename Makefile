clean:
	rm -f deploy.zip

build: clean
	zip -r deploy.zip relics CardData.js index.html script.js styles.css
