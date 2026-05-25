build: clean
	zip -r deploy.zip relics CardData.js index.html script.js styles.css bg.mp4

clean:
	rm -f deploy.zip

