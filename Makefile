
serve:
	# hugo server --theme=herring-cove
	# hugo server --theme=simple-style
	hugo server --theme=local

setup:
	git clone https://github.com/spf13/herring-cove.git ./themes/herring-cove
	git clone https://github.com/yanlinlin82/simple-style.git ./themes/simple-style

build:
	hugo --theme=local
