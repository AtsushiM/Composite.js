SRC = ./util.js ./Class.js ./Disposer.js ./Observer.js ./main.js
COMBINE = ../composite.js
COMPRESS = ../composite.min.js

$(COMBINE) : $(SRC)
	cat $^ > $@

	growlnotify -t 'auto-make' -m 'make start.'
	((java -jar /Applications/gcc/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "/* composite.js v0.1 (c) 2013 Atsushi Mizoue. */!function(){%output%}();" --js $(COMBINE) --js_output_file $(COMPRESS)) && growlnotify -t 'auto-make' -m 'make complete.') || growlnotify -t 'auto-make' -m 'make error.'
#	rm -f $(COMBINE)

.PHONY: clean
clean :
	rm -f $(COMBINE) $(COMPRESS)
