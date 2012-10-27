# Scrapy settings for quiz_parser project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/topics/settings.html
#

BOT_NAME = 'quiz_parser'

SPIDER_MODULES = ['quiz_parser.spiders']
ITEM_PIPELINES = ['quiz_parser.pipelines.QuestionExportPipeline']
NEWSPIDER_MODULE = 'quiz_parser.spiders'
DEFAULT_ITEM_CLASS = 'quiz_parser.items.SimpleQuestion'
USER_AGENT = '%s/1.0' % (BOT_NAME)
LOG_LEVEL = 'INFO'

