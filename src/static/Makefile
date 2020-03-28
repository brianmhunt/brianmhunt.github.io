
jekyll-version := 3.8

update:
	docker run \
		--rm \
		--volume="$$PWD:/srv/jekyll" \
		-it jekyll/jekyll:$(jekyll-version) \
		bundle update

serve:
	docker run \
		--rm \
		--volume="$$PWD:/srv/jekyll" \
		-it jekyll/jekyll:$(jekyll-version) \
		bundle exec serve

install:
	docker run \
		--rm \
		--volume="$$PWD:/srv/jekyll" \
		-it jekyll/jekyll:$(jekyll-version) \
		bundle install
