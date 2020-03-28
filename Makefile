
build:
	hugo --theme=local -s src -d ..

serve:
	cd src; hugo --theme=local server

