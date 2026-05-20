clean:
	rm -f deploy.zip

build: clean
	zip deploy.zip CardData.js index.html script.js styles.css
