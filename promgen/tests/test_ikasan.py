from unittest import mock
from django.test import TestCase, override_settings

from promgen import models
from promgen.sender.ikasan import SenderIkasan
from promgen.tests import TEST_ALERT, TEST_SETTINGS


_MESSAGE = '''node_down foo-BETA testhost.localhost:9100 node resolved

description: testhost.localhost:9100 of job node has been down for more than 5 minutes.
summary: Instance testhost.localhost:9100 down

Prometheus: https://monitoring.promehteus.localhost/graph#%5B%7B%22expr%22%3A%22up%20%3D%3D%200%22%2C%22tab%22%3A0%7D%5D
Alert Manager: https://am.promehteus.localhost'''


class IkasanTest(TestCase):
    @mock.patch('django.db.models.signals.post_save', mock.Mock())
    def setUp(self):
        self.service = models.Service.objects.create(name='Service 1')
        self.project = models.Project.objects.create(name='Project 1', service=self.service)
        self.sender = models.Sender.objects.create(
            project=self.project,
            sender='promgen.sender.ikasan',
            value='#',
        )

    @override_settings(PROMGEN=TEST_SETTINGS)
    @mock.patch('requests.post')
    def test_project(self, mock_post):
        self.assertEqual(SenderIkasan().send(TEST_ALERT), 1)
        mock_post.assert_called_once_with('http://ikasan.example', {
            'color': 'green',
            'channel': '#',
            'message': _MESSAGE}
        )
