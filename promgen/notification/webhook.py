# Copyright (c) 2017 LINE Corporation
# These sources are released under the terms of the MIT license: see LICENSE

'''
Simple webhook bridge
Accepts alert json from Alert Manager and then POSTs individual alerts to
configured webhook destinations
'''

import logging

from django import forms

from promgen import util
from promgen.celery import app as celery
from promgen.notification import NotificationBase

logger = logging.getLogger(__name__)


class FormWebhook(forms.Form):
    value = forms.CharField(
        required=True,
        label='URL'
    )


class NotificationWebhook(NotificationBase):
    '''
    Post notifications to a specific web endpoint
    '''
    form = FormWebhook

    @celery.task(bind=True)
    def _send(task, url, alert, data):
        params = {
            'externalURL': data.get('externalURL'),
            'alert': alert,
        }

        util.post(url, params)
        return True
