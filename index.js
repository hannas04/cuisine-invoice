
        function switchMode(mode) {
            const textMode = document.getElementById('text-mode');
            const formMode = document.getElementById('form-mode');
            const buttons = document.querySelectorAll('.mode-btn');

            buttons.forEach(btn => btn.classList.remove('active'));

            if (mode === 'text') {
                textMode.classList.add('active');
                formMode.classList.remove('active');
                buttons[0].classList.add('active');
            } else {
                formMode.classList.add('active');
                textMode.classList.remove('active');
                buttons[1].classList.add('active');
            }

            document.getElementById('invoice-preview').classList.remove('active');
        }

        function addMenuItem() {
            const container = document.getElementById('menu-items');
            const newItem = document.createElement('div');
            newItem.className = 'menu-item';
            newItem.innerHTML = `
                <input type="text" placeholder="Item name" class="item-name" required>
                <input type="number" placeholder="Price (₦)" class="item-price" min="0" required>
                <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
                <button class="remove-btn" onclick="removeItem(this)"><i class="fas fa-trash"></i></button>
            `;
            container.appendChild(newItem);
        }

        function removeItem(btn) {
            const items = document.querySelectorAll('.menu-item');
            if (items.length > 1) {
                btn.parentElement.remove();
            } else {
                alert('At least one menu item is required!');
            }
        }

        function parseTextInput(text) {
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            const data = { items: [] };
            let inMenuSection = false;

            lines.forEach(line => {
                if (line.includes('Date:')) {
                    data.date = line.split(':')[1].trim();
                } else if (line.includes('Guests:')) {
                    data.guests = line.split(':')[1].trim();
                } else if (line.includes('Location Area:')) {
                    data.location = line.split(':')[1].trim();
                } else if (line.includes('Hall/Address:')) {
                    data.address = line.split(':')[1].trim();
                } else if (line.includes('Contact Email:')) {
                    data.email = line.split(':')[1].trim();
                } else if (line.includes('SELECTED MENU ITEMS')) {
                    inMenuSection = true;
                } else if (inMenuSection && line.startsWith('*')) {
                    const parts = line.substring(1).split('-').map(p => p.trim());
                    if (parts.length >= 3) {
                        data.items.push({
                            name: parts[0],
                            price: parseFloat(parts[1]),
                            qty: parseInt(parts[2])
                        });
                    }
                }
            });

            return data;
        }

        function calculateTotals(items, transportFee) {
            let subtotal = 0;
            items.forEach(item => {
                subtotal += item.price * item.qty;
            });

            const serviceCharge = subtotal * 0.15;
            const subtotalWithService = subtotal + serviceCharge;
            const vat = subtotalWithService * 0.075;
            const grandTotal = subtotalWithService + vat + transportFee;

            return { subtotal, serviceCharge, vat, transportFee, grandTotal };
        }

        function generateInvoiceHTML(data, totals) {
            const invoiceNumber = 'INV-' + Date.now();
            const currentDate = new Date().toLocaleDateString();

            let itemsHTML = '';
            data.items.forEach(item => {
                const total = item.price * item.qty;
                itemsHTML += `
                    <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.qty}</td>
                        <td style="text-align: right;">₦${item.price.toLocaleString()}</td>
                        <td style="text-align: right;">₦${total.toLocaleString()}</td>
                    </tr>
                `;
            });

            return `
                <div class="invoice-header">
                    <div class="company-info">
                        <div class="company-name"><a href="#top" class="navbar-brand"><span>Cuisine</span> <span> Fantastique</span></a></div>
                       
                    </div>
                    
                </div>

                <div class="invoice-details">
                    <div class="detail-box">
                        <h3>Invoice Details</h3>
                        <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                        <p><strong>Date Issued:</strong> ${currentDate}</p>
                    </div>
                    <div class="detail-box">
                        <h3>Event Information</h3>
                        <p><strong>Event Date:</strong> ${data.date}</p>
                        <p><strong>Guests:</strong> ${data.guests}</p>
                        <p><strong>Location:</strong> ${data.location}</p>
                        <p><strong>Venue:</strong> ${data.address}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>

                <div class="totals-section">
                    <div class="totals-box">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>₦${totals.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>Service Charge (15%):</span>
                            <span>₦${totals.serviceCharge.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>VAT (7.5%):</span>
                            <span>₦${totals.vat.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>Transportation Fee:</span>
                            <span>₦${totals.transportFee.toLocaleString()}</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>GRAND TOTAL:</span>
                            <span>₦${totals.grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="payment-instructions">
                    <h3>PAYMENT INSTRUCTIONS</h3>
                    <div class="bank-details">
                        <strong>Bank Transfer:</strong><br>
                        Account Number: 2094187584<br>
                        Account Name: Cuisine Fantastique<br>
                        Bank Name: UBA
                    </div>
                    <p><strong>Important Terms & Conditions:</strong></p>
                    <ul style="margin-left: 20px; margin-top: 8px;">
                        <li style="margin-bottom: 4px;">A 100% non-refundable payment is required as commitment/booking fee</li>
                        <li style="margin-bottom: 4px;">All payments are non-refundable</li>
                        <li style="margin-bottom: 4px;">Kindly check if we are still available on your chosen date before paying a deposit</li>
                        <li style="margin-bottom: 4px;">In the case of a cancellation, all payments made are only transferable and cannot be refunded</li>
                        <li style="margin-bottom: 4px;">Please NOTE that the invoice is only valid for one month and prices can change based on market price</li>
                    </ul>
                </div>
            `;
        }

        function generateFromText() {
            const text = document.getElementById('text-input').value;
            const transportFee = parseFloat(document.getElementById('text-transport').value) || 0;

            if (!text.trim()) {
                alert('Please enter event and menu details!');
                return;
            }

            const data = parseTextInput(text);
            
            if (!data.items.length) {
                alert('No menu items found! Please check your format.');
                return;
            }

            const totals = calculateTotals(data.items, transportFee);
            const invoiceHTML = generateInvoiceHTML(data, totals);

            document.getElementById('invoice-content').innerHTML = invoiceHTML;
            document.getElementById('invoice-preview').classList.add('active');
            document.getElementById('invoice-preview').scrollIntoView({ behavior: 'smooth' });
        }

        function generateFromForm() {
            const date = document.getElementById('event-date').value;
            const guests = document.getElementById('guests').value;
            const location = document.getElementById('location').value;
            const address = document.getElementById('address').value;
            const email = document.getElementById('email').value;
            const transportFee = parseFloat(document.getElementById('form-transport').value) || 0;

            if (!date || !guests || !location || !address || !email) {
                alert('Please fill in all event details!');
                return;
            }

            const items = [];
            const menuItems = document.querySelectorAll('.menu-item');
            
            menuItems.forEach(item => {
                const name = item.querySelector('.item-name').value;
                const price = parseFloat(item.querySelector('.item-price').value);
                const qty = parseInt(item.querySelector('.item-qty').value);

                if (name && price && qty) {
                    items.push({ name, price, qty });
                }
            });

            if (!items.length) {
                alert('Please add at least one menu item!');
                return;
            }

            const data = {
                date,
                guests,
                location,
                address,
                email,
                items
            };

            const totals = calculateTotals(items, transportFee);
            const invoiceHTML = generateInvoiceHTML(data, totals);

            document.getElementById('invoice-content').innerHTML = invoiceHTML;
            document.getElementById('invoice-preview').classList.add('active');
            document.getElementById('invoice-preview').scrollIntoView({ behavior: 'smooth' });
        }

        function downloadPDF() {
            const element = document.getElementById('invoice-content');
            
            // Clone the element to avoid modifying the original
            const clone = element.cloneNode(true);
            clone.style.width = '210mm';
            clone.style.minHeight = '297mm';
            clone.style.padding = '15mm';
            clone.style.boxSizing = 'border-box';
            clone.style.background = 'white';
            
            const opt = {
                margin: [0, 0, 0, 0],
                filename: 'Cuisine_Fantastique_Invoice_' + Date.now() + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Show loading message
            const downloadBtn = document.querySelector('.pdf-btn');
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            downloadBtn.disabled = true;

            html2pdf().set(opt).from(clone).save().then(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }).catch(err => {
                console.error('PDF generation error:', err);
                alert('Error generating PDF. Please try again.');
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            });
        }

        function downloadImage() {
            const element = document.getElementById('invoice-content');
            
            // Show loading message
            const downloadBtn = document.querySelectorAll('.download-option-btn')[1];
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Image...';
            downloadBtn.disabled = true;

            // Set up html2canvas options for high quality image
            html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // A4 width in pixels at 96 DPI
                height: 1123, // A4 height in pixels at 96 DPI
                windowWidth: 794,
                windowHeight: 1123
            }).then(canvas => {
                // Convert canvas to blob
                canvas.toBlob(function(blob) {
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'Cuisine_Fantastique_Invoice_' + Date.now() + '.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    // Reset button
                    downloadBtn.innerHTML = originalText;
                    downloadBtn.disabled = false;
                }, 'image/png', 1.0);
            }).catch(err => {
                console.error('Image generation error:', err);
                alert('Error generating image. Please try again.');
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            });
        }
   