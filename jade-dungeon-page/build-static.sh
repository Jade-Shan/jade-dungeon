#!/bin/bash

echo "Tips:"
echo "-c compile"
echo "-a all"

while getopts "b:ctrae" arg #选项后面的冒号表示该选项需要参数
do
	case $arg in
		c)
			gulp clean-styles ;
			sleep 3 ;
			gulp build-less  ;
			sleep 5 ;
			gulp min-styles  ;
			sleep 5 ;
			gulp clean-scripts;
			sleep 3 ;
			gulp check-scripts;
			sleep 5 ;
			gulp min-scripts;
			sleep 5 ;
			gulp clean-html;
			sleep 3 ;
			gulp include-html;
			sleep 5 ;
			gulp process-html;
			;;
		a)
			# qrsync ~/.config/qiniu/workout.json ;
			;;
		?)  #当有不认识的选项的时候arg为?
			exit 1
			;;
	esac
done
