<?php

namespace MakinaCorpus\Drupal\MiniDialog\Twig\Extension;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

class MiniDialogExtension extends \Twig_Extension
{
    protected $router;

    protected $requestStack;

    public function setRouter(RouterInterface $router = null)
    {
        $this->router = $router;
    }

    public function setRequestStack(RequestStack $requestStack = null)
    {
        $this->requestStack = $requestStack;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('minidialog_open', [$this, 'renderOpenLink'], ['is_safe' => ['html']]),
        ];
    }

    private function getRequestRelativeUri(Request $request)
    {
        if (null !== ($qs = $request->getQueryString())) {
            $qs = '?' . $qs;
        }

        return trim($request->getPathInfo(), '/') . $qs;
    }

    public function renderOpenLink($route = null, $parameters = [], $withDestination = true, $wide = false, $ajaxify = true)
    {
        $parameters['minidialog'] = 1;
        if ($withDestination) {
            $parameters['destination'] = $this->getRequestRelativeUri($this->requestStack->getCurrentRequest());
        }
        if ($wide) {
            $parameters['wide'] = 1;
        }
        if ($ajaxify) {
            $parameters['ajaxify'] = 1;
        }

        if (null === $this->router) {
            return url($route, ['query' => $parameters]);
        }

        return $this->router->generate($route, $parameters);
    }

    public function getName()
    {
        return 'minidialog';
    }
}
