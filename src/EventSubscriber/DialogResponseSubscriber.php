<?php

namespace MakinaCorpus\Drupal\MiniDialog\EventSubscriber;

use Drupal\Core\Ajax\AjaxResponse;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class DialogResponseSubscriber implements EventSubscriberInterface
{
    /**
     * {@inheritdoc}
     */
    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::RESPONSE => [
                ['onResponse', -100]
            ],
        ];
    }

    public function onResponse(FilterResponseEvent $event)
    {
        $request = $event->getRequest();

        if (!$request->isXmlHttpRequest() && !$request->isMethod('POST')) {
            return;
        }
        if (!$request->query->get('minidialog')) {
            return;
        }

        // When catching a redirect response from a minidialog XmlHttpRequest,
        // we should send it via the minidialog AJAX command instead in order
        // to ensure we won't attempt to fill the dialog with the redirect
        $response = $event->getResponse();

        if ($response instanceof RedirectResponse) {
            $event->setResponse(
                (new AjaxResponse())->addCommand([
                    'command'   => 'invoke',
                    'selector'  => null,
                    'method'    => 'MiniDialogClose',
                    'arguments' => [$response->getTargetUrl()],
                ])
            );
        }
    }
}
