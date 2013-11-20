build: components index.js
	@component build -s salesforce -n salesforce

components: component.json
	@component install

clean:
	rm -fr build components

.PHONY: clean
