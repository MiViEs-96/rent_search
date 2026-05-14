import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  url: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
}

export async function scrapeDaft(params: {
  rooms?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  try {
    const { rooms = 1, maxPrice = 5000 } = params;

    const searchUrl = `https://www.daft.ie/property-for-rent/dublin-city?num_bedrooms_min=${rooms}&max_price=${maxPrice}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const properties: Property[] = [];

    const nextData = $('#__NEXT_DATA__').html();

    if (nextData) {
      const parsedData = JSON.parse(nextData);
      const listings = parsedData.props?.pageProps?.listings || [];

      listings.forEach((item: any) => {
        const listing = item.listing;
        if (!listing) return;

        properties.push({
          id: listing.id.toString(),
          title: listing.title || 'Property',
          price: listing.priceV2?.amount || listing.price || 0,
          address: listing.address || 'Dublin',
          url: `https://www.daft.ie${listing.seoFriendlyPath}`,
          image: listing.media?.images?.[0]?.size720x480 || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
          bedrooms: parseInt(listing.numBedrooms) || 0,
          bathrooms: parseInt(listing.numBathrooms) || 0,
          latitude: parseFloat(listing.point?.coordinates?.[1]) || 53.3498,
          longitude: parseFloat(listing.point?.coordinates?.[0]) || -6.2603,
        });
      });
    }

    if (properties.length > 0) {
      return properties;
    }

    $('.SearchPage__StyledListItem-sc-1268p9d-1').each((_, el) => {
        const title = $(el).find('[data-testid="address"]').text();
        const priceText = $(el).find('[data-testid="price"]').text();
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        const url = $(el).find('a').attr('href');

        if (title && url) {
            properties.push({
                id: Math.random().toString(36).substr(2, 9),
                title,
                price,
                address: title,
                url: `https://www.daft.ie${url}`,
                image: $(el).find('img').attr('src') || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
                bedrooms: rooms,
                bathrooms: 1,
                latitude: 53.3498 + (Math.random() - 0.5) * 0.1,
                longitude: -6.2603 + (Math.random() - 0.5) * 0.1,
            });
        }
    });

    if (properties.length > 0) return properties;

    throw new Error('No properties found via scraping');
  } catch (error) {
    console.warn('Real-time scraping failed, using sample data:', error);
    return getSampleProperties().filter(p => p.bedrooms >= (params.rooms || 0) && p.price <= (params.maxPrice || 10000));
  }
}

function getSampleProperties(): Property[] {
  return [
    {
      id: 's1',
      title: 'Modern Apartment in Grand Canal Dock',
      price: 2500,
      address: 'Grand Canal Dock, Dublin 2',
      url: 'https://www.daft.ie/for-rent/apartment-grand-canal-dock-dublin-2/1',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      bedrooms: 2,
      bathrooms: 2,
      latitude: 53.3421,
      longitude: -6.2394,
    },
    {
      id: 's2',
      title: 'Cosy House in Rathmines',
      price: 3200,
      address: 'Rathmines, Dublin 6',
      url: 'https://www.daft.ie/for-rent/house-rathmines-dublin-6/2',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      bedrooms: 3,
      bathrooms: 2,
      latitude: 53.3228,
      longitude: -6.2675,
    },
    {
      id: 's3',
      title: 'Charming Studio in Phibsborough',
      price: 1500,
      address: 'Phibsborough, Dublin 7',
      url: 'https://www.daft.ie/for-rent/studio-phibsborough-dublin-7/3',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
      bedrooms: 1,
      bathrooms: 1,
      latitude: 53.3606,
      longitude: -6.2715,
    },
    {
      id: 's4',
      title: 'Spacious Family Home in Clontarf',
      price: 4500,
      address: 'Clontarf, Dublin 3',
      url: 'https://www.daft.ie/for-rent/house-clontarf-dublin-3/4',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      bedrooms: 4,
      bathrooms: 3,
      latitude: 53.3631,
      longitude: -6.2168,
    }
  ];
}
