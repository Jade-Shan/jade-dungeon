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
			sleep 3 ;
			gulp min-styles  ;
			sleep 3 ;
			gulp clean-scripts;
			sleep 3 ;
			gulp check-scripts;
			sleep 3 ;
			gulp min-scripts;
			;;
		a)
			# qrsync ~/.config/qiniu/workout.json ;
			;;
		?)  #当有不认识的选项的时候arg为?
			exit 1
			;;
	esac
done
