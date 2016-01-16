#!/bin/bash

echo "Tips:"
echo "-c compile"
echo "-a all"

while getopts "b:ctrae" arg #选项后面的冒号表示该选项需要参数
do
	case $arg in
		c)
			gulp clean       ;
			gulp check-js    ;
			gulp build-less  ;
			sleep 5 ;
			gulp min-styles  ;
			gulp min-scripts ;
			;;
		a)
			gulp clean       ;
			sleep 5 ;
			gulp check-js    ;
			gulp build-less  ;
			sleep 5 ;
			gulp min-styles  ;
			gulp min-scripts ;
			sleep 5 ;
			# qrsync ~/.config/qiniu/workout.json ;
			;;
		?)  #当有不认识的选项的时候arg为?
			exit 1
			;;
	esac
done
