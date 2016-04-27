package net.jadedungeon.blog

import jadeutils.common.Logging
import jadeutils.common.EnvPropsComponent

trait BlogRecDaoCompoment extends Logging {
	this: EnvPropsComponent =>

	object RecDaos {

		import scala.collection.JavaConversions._

		val host: String = getProperty("mongo.host")
		val port: Int    = Integer.parseInt(getProperty("mongo.port"))
		val auth = getProperty("mongo.authList.jadedungeon").split("`") :: Nil

		logDebug("----------- Creating jounaryRecordDao: {}, {}, {}", host, port, auth)
		val journalDao = new JournalDao(host, port, auth)
		logDebug("----------- Creating galleryRecordDao: {}, {}, {}", host, port, auth)
		val galleryDao = new GalleryDao(host, port, auth)
	}
}

trait BlogAppCtx extends EnvPropsComponent with BlogRecDaoCompoment
with BlogRecService with Logging 
{

	val cfgFile = "blog.properties"
	logDebug("----------- Loading props: {}", cfgFile)

	val envProps = new java.util.Properties()
	envProps.load(Thread.currentThread().getContextClassLoader()
		.getResourceAsStream(cfgFile))

	val cdn3rd = getProperty("cdn.3rd")
	val cdnjadeutils = getProperty("cdn.jadeutils")
	val cdnblog = getProperty("cdn.blog")
	val appbasepath = getProperty("app.basepath")

}
