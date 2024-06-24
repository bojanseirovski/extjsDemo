<?php

function paginateXML($xmlFilePath, $page, $perPage)
{
    // Load the XML file
    if (!file_exists($xmlFilePath)) {
        return '<error>File not found.</error>';
    }

    $xmlData = simplexml_load_file($xmlFilePath);
    if ($xmlData === false) {
        return '<error>Invalid XML data.</error>';
    }

    // Convert XML to an array
    $data = json_decode(json_encode($xmlData), true);

    if (isset($data['hooks']['hook']['data']['record'])) {
        $items = $data['hooks']['hook']['data']['record']; //is_array($data['item']) ? $data['item'] : [$data['item']];
    } else {
        $items = [];
    }

    // Calculate total items and total pages
    $totalItems = count($items);
    $totalPages = ceil($totalItems / $perPage);

    // Ensure the page number is within bounds
    if ($page < 1) {
        $page = 1;
    } elseif ($page > $totalPages) {
        $page = $totalPages;
    }

    // Calculate the offset and slice the data
    $offset = ($page - 1) * $perPage;
    $paginatedData = array_slice($items, $offset, $perPage);

    // Create the XML response
    $response = new SimpleXMLElement('<response/>');
    $response->addChild('current_page', $page);
    $response->addChild('per_page', $perPage);
    $response->addChild('total_items', $totalItems);
    $response->addChild('total_pages', $totalPages);
    $rootElement = $response->addChild('root');
    $hooksElement = $rootElement->addChild('hooks');
    $hookElement = $hooksElement->addChild('hook');
    $dataElement = $hookElement->addChild('data');

    foreach ($paginatedData as $item) {
        $itemElement = $dataElement->addChild('record');
        foreach ($item as $key => $value) {
            if (is_array($value)) {
                $subElement = $itemElement->addChild($key);
                foreach ($value as $subKey => $subValue) {
                    if (is_array($subValue)) {
                        $subValue = implode(' ', $subValue);
                    }
                    $subElement->addChild($subKey, htmlspecialchars($subValue));
                }
            } else {
                $itemElement->addChild($key, htmlspecialchars($value));
            }
        }
    }

    return $response->asXML();
}

// Usage example
$xmlFilePath = 'index.xml'; // Replace with your XML file path
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$pageSize = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;

header('Content-Type: application/xml');
echo paginateXML($xmlFilePath, $page, $pageSize);
